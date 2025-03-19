import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '../../../utils/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = getSupabase()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  })
}
