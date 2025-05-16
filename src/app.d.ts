// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SupabaseClient, User } from '@supabase/supabase-js'

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient
			safeGetSession: () => Promise<{
				session: {
					user: User
					access_token: string
					refresh_token: string
				} | null
				user: User | null
			}>
			session: {
				user: User
				access_token: string
				refresh_token: string
			} | null
			user: User | null
		}
		interface PageData {
			session: {
				user: User
				access_token: string
				refresh_token: string
			} | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
