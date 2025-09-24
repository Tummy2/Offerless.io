import { createClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Transform the data before validation
    const transformedData = {
      ...body,
      applied_at: new Date(body.applied_at),
      salary_amount: body.salary_amount ? Number(body.salary_amount) : null,
    }
    
    // Validate input
    const validatedData = applicationSchema.parse(transformedData)

    const { data: application, error } = await supabase
      .from('applications')
      .update({
        company: validatedData.company,
        job_title: validatedData.job_title,
        applied_at: validatedData.applied_at.toISOString().split('T')[0],
        status: validatedData.status,
        company_url: validatedData.company_url,
        salary_amount: validatedData.salary_amount,
        salary_type: validatedData.salary_type,
        location_label: validatedData.location_label,
        location_kind: validatedData.location_kind,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }

    return NextResponse.json(application)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}