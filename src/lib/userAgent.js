export function parseUserAgent(userAgent) {
    if (!userAgent) return { browser: 'Unknown', os: 'Unknown', deviceType: 'Unknown' };

    let browser = 'Unknown';
    if (userAgent.indexOf("Firefox") > -1) {
        browser = "Firefox";
    } else if (userAgent.indexOf("SamsungBrowser") > -1) {
        browser = "Samsung Internet";
    } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
        browser = "Opera";
    } else if (userAgent.indexOf("Trident") > -1) {
        browser = "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
        browser = "Edge";
    } else if (userAgent.indexOf("Chrome") > -1) {
        browser = "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
        browser = "Safari";
    }

    let os = 'Unknown';
    if (userAgent.indexOf("Win") > -1) os = "Windows";
    else if (userAgent.indexOf("Mac") > -1) os = "MacOS";
    else if (userAgent.indexOf("Linux") > -1) os = "Linux";
    else if (userAgent.indexOf("Android") > -1) os = "Android";
    else if (userAgent.indexOf("iOS") > -1) os = "iOS";

    let deviceType = 'Desktop';
    if (/Mobi|Android/i.test(userAgent)) {
        deviceType = 'Mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'Tablet';
    }

    return { browser, os, deviceType };
}
