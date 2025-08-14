import fs from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

interface Lead {
  id: string
  name: string
  email: string
  message: string
  phone: string
  timestamp: string
  source_url: string | null
  status: 'New' | 'Contacted' | 'Closed'
}


// DELETE lead
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params


  const filePath = path.join(process.cwd(), 'data', 'leads.json')

  try {
    const jsonData = await fs.readFile(filePath, 'utf8')
    const leads: Lead[] = JSON.parse(jsonData)

    const leadIndex = leads.findIndex((l) => l.id === id)
    if (leadIndex === -1) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 })
    }

    leads.splice(leadIndex, 1)
    await fs.writeFile(filePath, JSON.stringify(leads, null, 2))

    return NextResponse.json({ message: 'Lead deleted successfully' })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH lead status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params


  const { status } = (await req.json()) as { status?: Lead['status'] }
  if (!status) {
    return NextResponse.json({ message: 'Status is required' }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'data', 'leads.json')

  try {
    const jsonData = await fs.readFile(filePath, 'utf8')
    const leads: Lead[] = JSON.parse(jsonData)

    const leadToUpdate = leads.find((l) => l.id === id)
    if (!leadToUpdate) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 })
    }

    leadToUpdate.status = status
    await fs.writeFile(filePath, JSON.stringify(leads, null, 2))

    return NextResponse.json({
      message: 'Lead status updated successfully',
      lead: leadToUpdate
    })
  } catch (error) {
    console.error('Error updating lead status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
