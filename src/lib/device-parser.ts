/**
 * Parse device information from user agent string
 */

export interface DeviceInfo {
  deviceName: string
  deviceType: "mobile" | "desktop" | "tablet" | "unknown"
  browser?: string
  os?: string
}

export function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      deviceName: "Unknown Device",
      deviceType: "unknown",
    }
  }

  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType: "mobile" | "desktop" | "tablet" | "unknown" = "unknown"
  let deviceName = "Unknown Device"

  // Mobile detection
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = "mobile"
    
    if (/iphone/i.test(ua)) {
      deviceName = "iPhone"
    } else if (/ipod/i.test(ua)) {
      deviceName = "iPod"
    } else if (/android/i.test(ua)) {
      deviceName = "Android Phone"
    } else if (/blackberry/i.test(ua)) {
      deviceName = "BlackBerry"
    } else {
      deviceName = "Mobile Device"
    }
  }
  // Tablet detection
  else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet"
    
    if (/ipad/i.test(ua)) {
      deviceName = "iPad"
    } else if (/android/i.test(ua)) {
      deviceName = "Android Tablet"
    } else {
      deviceName = "Tablet"
    }
  }
  // Desktop detection
  else {
    deviceType = "desktop"
    
    if (/windows/i.test(ua)) {
      deviceName = "Windows PC"
    } else if (/macintosh|mac os x/i.test(ua)) {
      deviceName = "Mac"
    } else if (/linux/i.test(ua)) {
      deviceName = "Linux PC"
    } else {
      deviceName = "Desktop"
    }
  }

  // Detect browser
  let browser: string | undefined
  if (/chrome/i.test(ua) && !/edg|opr/i.test(ua)) {
    browser = "Chrome"
  } else if (/firefox/i.test(ua)) {
    browser = "Firefox"
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari"
  } else if (/edg/i.test(ua)) {
    browser = "Edge"
  } else if (/opr/i.test(ua)) {
    browser = "Opera"
  }

  // Detect OS
  let os: string | undefined
  if (/windows/i.test(ua)) {
    if (/windows nt 10/i.test(ua)) {
      os = "Windows 10/11"
    } else if (/windows nt 6.3/i.test(ua)) {
      os = "Windows 8.1"
    } else if (/windows nt 6.2/i.test(ua)) {
      os = "Windows 8"
    } else if (/windows nt 6.1/i.test(ua)) {
      os = "Windows 7"
    } else {
      os = "Windows"
    }
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS"
  } else if (/linux/i.test(ua)) {
    os = "Linux"
  } else if (/android/i.test(ua)) {
    os = "Android"
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS"
  }

  // Build device name with browser/OS info
  const parts: string[] = [deviceName]
  if (os) {
    parts.push(os)
  }
  if (browser) {
    parts.push(browser)
  }

  return {
    deviceName: parts.join(" - "),
    deviceType,
    browser,
    os,
  }
}

