import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { filename, filetype, data } = req.body

    if (!filename || !data) {
      return res.status(400).json({ error: 'filename and data are required' })
    }

    // Extract the base64 data (remove data:image/xxx;base64, prefix if present)
    const base64Data = data.replace(/^data:[^;]+;base64,/, '')

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename using timestamp + random
    const ext = filename.split('.').pop() || 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    // Write file to public/uploads/
    const filePath = join(uploadsDir, uniqueName)
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${uniqueName}`

    return res.status(200).json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: error.message })
  }
}
