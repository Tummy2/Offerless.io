import { createClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '100')
    const sortBy = searchParams.get('sortBy') || 'applied_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('q')
    const status = searchParams.get('status')
    const locationKind = searchParams.get('locationKind')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)

    // Apply filters
    if (search) {
      query = query.or(
        `company.ilike.%${search}%,job_title.ilike.%${search}%,location_label.ilike.%${search}%`
      )
    }

    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    if (locationKind) {
      query = query.eq('location_kind', locationKind)
    }

    if (from) {
      query = query.gte('applied_at', from)
    }

    if (to) {
      query = query.lte('applied_at', to)
    }

    // Apply sorting
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Apply pagination
    const offset = (page - 1) * pageSize
    query = query.range(offset, offset + pageSize - 1)

    const { data: applications, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

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
      .insert({
        user_id: user.id,
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
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}