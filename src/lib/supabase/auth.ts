'use server'

import { createClient } from './server'

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const supabase = createClient()
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

export async function getSession() {
  const supabase = createClient()
  return await supabase.auth.getSession()
}

export async function getUser() {
  const supabase = createClient()
  return await supabase.auth.getUser()
}
