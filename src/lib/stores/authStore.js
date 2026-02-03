import { writable } from 'svelte/store'
import { supabase } from '$lib/supabaseClient'

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    session: null,
    loading: true,
  })

  return {
    subscribe,
    set,
    update,

    // Initialize auth state and set up listener
    initialize: async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          update((state) => ({ ...state, loading: false }))
          return
        }

        update((state) => ({
          ...state,
          user: session?.user ?? null,
          session: session,
          loading: false,
        }))

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          update((state) => ({
            ...state,
            user: session?.user ?? null,
            session: session,
            loading: false,
          }))
        })
      } catch (error) {
        console.error('Auth initialization error:', error)
        update((state) => ({ ...state, loading: false }))
      }
    },

    // Sign up new user
    signUp: async (email, password, fullName) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    },

    // Sign in existing user
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    },

    // Sign out
    signOut: async () => {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      update((state) => ({
        ...state,
        user: null,
        session: null,
      }))

      return { success: true }
    },

    // Reset password
    resetPassword: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    },

    // Update password
    updatePassword: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    },
  }
}

export const authStore = createAuthStore()
