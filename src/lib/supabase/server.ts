import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

type CookieHandler = {
  get: (name: string) => Promise<string | undefined>
  set: (name: string, value: string, options: CookieOptions) => Promise<void>
  remove: (name: string, options: CookieOptions) => Promise<void>
}

function createCookieHandler(): CookieHandler {
  return {
    async get(name: string) {
      const cookieStore = cookies()
      return (await cookieStore).get(name)?.value
    },
    async set(name: string, value: string, options: CookieOptions) {
      try {
        const cookieStore = cookies()
        ;(await cookieStore).set(name, value, options)
      } catch (error) {
        console.error('Error setting cookie:', error)
      }
    },
    async remove(name: string, options: CookieOptions) {
      try {
        const cookieStore = cookies()
        ;(await cookieStore).set(name, '', options)
      } catch (error) {
        console.error('Error removing cookie:', error)
      }
    },
  }
}

export function createClient() {
  const cookieHandler = createCookieHandler()

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return await cookieHandler.get(name)
        },
        async set(name: string, value: string, options: CookieOptions) {
          await cookieHandler.set(name, value, options)
        },
        async remove(name: string, options: CookieOptions) {
          await cookieHandler.remove(name, options)
        },
      },
    }
  )
}
