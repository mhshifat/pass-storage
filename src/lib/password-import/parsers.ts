/**
 * Password Import Parsers
 * Supports CSV, JSON, and popular password manager formats
 */

export interface ParsedPassword {
  name: string
  username: string
  password: string
  url?: string | null
  notes?: string | null
  folderId?: string | null
  totpSecret?: string | null
  errors?: string[]
  warnings?: string[]
}

export interface ImportResult {
  passwords: ParsedPassword[]
  errors: string[]
  warnings: string[]
  totalRows: number
  validRows: number
  invalidRows: number
}

/**
 * Parse CSV file content
 */
export function parseCSV(content: string): ImportResult {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length === 0) {
    return {
      passwords: [],
      errors: ['CSV file is empty'],
      warnings: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }

  // Parse header row
  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim())
  
  // Find column indices
  const nameIndex = findColumnIndex(headers, ['name', 'title', 'website', 'site'])
  const usernameIndex = findColumnIndex(headers, ['username', 'user', 'login', 'email'])
  const passwordIndex = findColumnIndex(headers, ['password', 'pass', 'pwd'])
  const urlIndex = findColumnIndex(headers, ['url', 'website', 'site', 'uri'])
  const notesIndex = findColumnIndex(headers, ['notes', 'note', 'description', 'desc', 'comment'])

  if (nameIndex === -1 || usernameIndex === -1 || passwordIndex === -1) {
    return {
      passwords: [],
      errors: ['CSV must contain columns: name/title, username/user, password/pass'],
      warnings: [],
      totalRows: lines.length - 1,
      validRows: 0,
      invalidRows: lines.length - 1,
    }
  }

  const passwords: ParsedPassword[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue

    try {
      const values = parseCSVLine(line)
      
      const name = values[nameIndex]?.trim() || ''
      const username = values[usernameIndex]?.trim() || ''
      const password = values[passwordIndex]?.trim() || ''
      const url = urlIndex >= 0 ? values[urlIndex]?.trim() || null : null
      const notes = notesIndex >= 0 ? values[notesIndex]?.trim() || null : null

      const rowErrors: string[] = []
      const rowWarnings: string[] = []

      if (!name) rowErrors.push('Name is required')
      if (!username) rowErrors.push('Username is required')
      if (!password) rowErrors.push('Password is required')

      if (url && !isValidUrl(url)) {
        rowWarnings.push('Invalid URL format')
      }

      passwords.push({
        name,
        username,
        password,
        url: url || null,
        notes: notes || null,
        folderId: null,
        totpSecret: null,
        errors: rowErrors.length > 0 ? rowErrors : undefined,
        warnings: rowWarnings.length > 0 ? rowWarnings : undefined,
      })

      if (rowErrors.length > 0) {
        errors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`)
      }
      if (rowWarnings.length > 0) {
        warnings.push(`Row ${i + 1}: ${rowWarnings.join(', ')}`)
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const validRows = passwords.filter(p => !p.errors || p.errors.length === 0).length
  const invalidRows = passwords.length - validRows

  return {
    passwords,
    errors,
    warnings,
    totalRows: lines.length - 1,
    validRows,
    invalidRows,
  }
}

/**
 * Parse JSON file content
 */
export function parseJSON(content: string): ImportResult {
  try {
    const data = JSON.parse(content)
    const passwords: ParsedPassword[] = []
    const errors: string[] = []
    const warnings: string[] = []

    // Handle array of passwords
    const items = Array.isArray(data) ? data : [data]

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const rowErrors: string[] = []
      const rowWarnings: string[] = []

      const name = item.name || item.title || item.website || item.site || ''
      const username = item.username || item.user || item.login || item.email || ''
      const password = item.password || item.pass || item.pwd || ''
      const url = item.url || item.website || item.site || item.uri || null
      const notes = item.notes || item.note || item.description || item.desc || item.comment || null

      if (!name) rowErrors.push('Name is required')
      if (!username) rowErrors.push('Username is required')
      if (!password) rowErrors.push('Password is required')

      if (url && !isValidUrl(url)) {
        rowWarnings.push('Invalid URL format')
      }

      passwords.push({
        name: String(name),
        username: String(username),
        password: String(password),
        url: url ? String(url) : null,
        notes: notes ? String(notes) : null,
        folderId: null,
        totpSecret: null,
        errors: rowErrors.length > 0 ? rowErrors : undefined,
        warnings: rowWarnings.length > 0 ? rowWarnings : undefined,
      })

      if (rowErrors.length > 0) {
        errors.push(`Item ${i + 1}: ${rowErrors.join(', ')}`)
      }
      if (rowWarnings.length > 0) {
        warnings.push(`Item ${i + 1}: ${rowWarnings.join(', ')}`)
      }
    }

    const validRows = passwords.filter(p => !p.errors || p.errors.length === 0).length
    const invalidRows = passwords.length - validRows

    return {
      passwords,
      errors,
      warnings,
      totalRows: items.length,
      validRows,
      invalidRows,
    }
  } catch (error) {
    return {
      passwords: [],
      errors: [`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }
}

/**
 * Parse 1Password export (1PIF format)
 */
export function parse1Password(content: string): ImportResult {
  // 1Password exports are in 1PIF format (tab-separated)
  // Format: ***1Password Interchange File: <version>***
  // Then entries separated by ***
  
  const passwords: ParsedPassword[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Check if it's a 1PIF file
  if (!content.includes('***1Password')) {
    return {
      passwords: [],
      errors: ['Invalid 1Password export format'],
      warnings: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }

  // Split by entry separator
  const entries = content.split('***').filter(entry => entry.trim() && !entry.includes('1Password Interchange File'))

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const lines = entry.split('\n').filter(line => line.trim())
    
    let name = ''
    let username = ''
    let password = ''
    let url: string | null = null
    let notes: string | null = null

    for (const line of lines) {
      if (line.startsWith('title:')) name = line.substring(6).trim()
      else if (line.startsWith('username:')) username = line.substring(9).trim()
      else if (line.startsWith('password:')) password = line.substring(9).trim()
      else if (line.startsWith('url:')) url = line.substring(4).trim()
      else if (line.startsWith('notesPlain:')) notes = line.substring(11).trim()
    }

    const rowErrors: string[] = []
    const rowWarnings: string[] = []

    if (!name) rowErrors.push('Name is required')
    if (!username) rowWarnings.push('Username is missing')
    if (!password) rowErrors.push('Password is required')

    if (url && !isValidUrl(url)) {
      rowWarnings.push('Invalid URL format')
    }

    passwords.push({
      name: name || `Entry ${i + 1}`,
      username: username || '',
      password: password || '',
      url: url || null,
      notes: notes || null,
      folderId: null,
      totpSecret: null,
      errors: rowErrors.length > 0 ? rowErrors : undefined,
      warnings: rowWarnings.length > 0 ? rowWarnings : undefined,
    })

    if (rowErrors.length > 0) {
      errors.push(`Entry ${i + 1}: ${rowErrors.join(', ')}`)
    }
    if (rowWarnings.length > 0) {
      warnings.push(`Entry ${i + 1}: ${rowWarnings.join(', ')}`)
    }
  }

  const validRows = passwords.filter(p => !p.errors || p.errors.length === 0).length
  const invalidRows = passwords.length - validRows

  return {
    passwords,
    errors,
    warnings,
    totalRows: entries.length,
    validRows,
    invalidRows,
  }
}

/**
 * Parse LastPass CSV export
 */
export function parseLastPass(content: string): ImportResult {
  // LastPass CSV format: url,username,password,extra,name,grouping,fav
  return parseCSV(content) // LastPass uses standard CSV format
}

/**
 * Parse Bitwarden JSON export
 */
export function parseBitwarden(content: string): ImportResult {
  try {
    const data = JSON.parse(content)
    const passwords: ParsedPassword[] = []
    const errors: string[] = []
    const warnings: string[] = []

    if (!data.items || !Array.isArray(data.items)) {
      return {
        passwords: [],
        errors: ['Invalid Bitwarden export format'],
        warnings: [],
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
      }
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]
      const rowErrors: string[] = []
      const rowWarnings: string[] = []

      const name = item.name || ''
      const username = item.login?.username || ''
      const password = item.login?.password || ''
      const url = item.login?.uris?.[0]?.uri || item.login?.uri || null
      const notes = item.notes || null

      if (!name) rowErrors.push('Name is required')
      if (!password) rowErrors.push('Password is required')

      if (url && !isValidUrl(url)) {
        rowWarnings.push('Invalid URL format')
      }

      passwords.push({
        name: String(name),
        username: String(username),
        password: String(password),
        url: url ? String(url) : null,
        notes: notes ? String(notes) : null,
        folderId: null,
        totpSecret: item.login?.totp || null,
        errors: rowErrors.length > 0 ? rowErrors : undefined,
        warnings: rowWarnings.length > 0 ? rowWarnings : undefined,
      })

      if (rowErrors.length > 0) {
        errors.push(`Item ${i + 1}: ${rowErrors.join(', ')}`)
      }
      if (rowWarnings.length > 0) {
        warnings.push(`Item ${i + 1}: ${rowWarnings.join(', ')}`)
      }
    }

    const validRows = passwords.filter(p => !p.errors || p.errors.length === 0).length
    const invalidRows = passwords.length - validRows

    return {
      passwords,
      errors,
      warnings,
      totalRows: data.items.length,
      validRows,
      invalidRows,
    }
  } catch (error) {
    return {
      passwords: [],
      errors: [`Invalid Bitwarden JSON: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
    }
  }
}

/**
 * Parse KeePass CSV export
 */
export function parseKeePass(content: string): ImportResult {
  // KeePass CSV format: Account,Login Name,Password,Web Site,Comments
  return parseCSV(content) // KeePass uses standard CSV format
}

/**
 * Main parser function that detects format and parses accordingly
 */
export function parsePasswordFile(content: string, format?: 'csv' | 'json' | '1password' | 'lastpass' | 'bitwarden' | 'keepass'): ImportResult {
  if (format) {
    switch (format) {
      case 'csv':
        return parseCSV(content)
      case 'json':
        return parseJSON(content)
      case '1password':
        return parse1Password(content)
      case 'lastpass':
        return parseLastPass(content)
      case 'bitwarden':
        return parseBitwarden(content)
      case 'keepass':
        return parseKeePass(content)
      default:
        return {
          passwords: [],
          errors: [`Unsupported format: ${format}`],
          warnings: [],
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
        }
    }
  }

  // Auto-detect format
  if (content.includes('***1Password')) {
    return parse1Password(content)
  }
  
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    // Try to detect Bitwarden format
    try {
      const data = JSON.parse(content)
      if (data.items && Array.isArray(data.items)) {
        return parseBitwarden(content)
      }
      return parseJSON(content)
    } catch {
      return parseJSON(content)
    }
  }

  // Default to CSV
  return parseCSV(content)
}

// Helper functions

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.includes(name))
    if (index !== -1) return index
  }
  return -1
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}
