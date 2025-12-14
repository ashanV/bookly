import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { csrfMiddleware } from "@/lib/csrf";

export async function POST(req) {
  try {
    // CSRF validation
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
      return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "bookly";
    const type = formData.get("type") || "image"; // 'profile', 'banner', 'portfolio', 'employee'

    if (!file) {
      return NextResponse.json(
        { error: "Brak pliku do uploadowania" },
        { status: 400 }
      );
    }

    // Sprawdź typ pliku
    if (!file.type || !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Plik musi być obrazem" },
        { status: 400 }
      );
    }

    // Określ folder w zależności od typu
    let uploadFolder = folder;
    if (type === "profile") {
      uploadFolder = `${folder}/profile`;
    } else if (type === "banner") {
      uploadFolder = `${folder}/banners`;
    } else if (type === "portfolio") {
      uploadFolder = `${folder}/portfolio`;
    } else if (type === "employee") {
      uploadFolder = `${folder}/employees`;
    }

    // Konwertuj plik (File/Blob) na Buffer, a następnie na base64 string
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload do Cloudinary używając base64 string
    const result = await uploadToCloudinary(base64String, {
      folder: uploadFolder,
      resource_type: "image",
      transformation: [
        {
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        public_id: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: error.message || "Wystąpił błąd podczas uploadowania pliku",
      },
      { status: 500 }
    );
  }
}

// Endpoint do usuwania zdjęć
export async function DELETE(req) {
  try {
    // CSRF validation
    const csrfError = await csrfMiddleware(req);
    if (csrfError) {
      return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
    }

    const { searchParams } = new URL(req.url);
    const public_id = searchParams.get("public_id");

    if (!public_id) {
      return NextResponse.json(
        { error: "Brak public_id do usunięcia" },
        { status: 400 }
      );
    }

    const { deleteFromCloudinary } = await import("@/lib/cloudinary");
    const result = await deleteFromCloudinary(public_id);

    return NextResponse.json(
      {
        success: true,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        error: error.message || "Wystąpił błąd podczas usuwania pliku",
      },
      { status: 500 }
    );
  }
}

