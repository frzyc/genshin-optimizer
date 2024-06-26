'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSupabase } from '../../utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = getSupabase()
  const data = {
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signup(formData: FormData) {
  const supabase = getSupabase()

  const data = {
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  }

  const { error } = await supabase.auth.signUp(data)
  if (error) {
    console.error(error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}
