import type { SupabaseClient } from '@supabase/supabase-js'

export interface Logo {
  id: string
  title: string
  imageUrl: string
  uploaderUid: string
  uploaderName: string
  uploaderAvatar: string
  uploaderEmail: string
  votes: string[]
  createdAt: string | null
}

const isVotingOpen = () => {
  const { countdown } = useAppConfig()
  return Date.now() < new Date(countdown.target).getTime()
}

export const useLogos = () => {
  const { $supabase } = useNuxtApp()
  const { user } = useAuth()

  const logos = useState<Logo[]>('logos', () => [])
  const logosLoading = useState<boolean>('logos-loading', () => true)
  const uploadLoading = useState<boolean>('upload-loading', () => false)
  const uploadError = useState<string | null>('upload-error', () => null)

  const sortMode = useState<'votes' | 'recent'>('sort-mode', () => 'votes')

  const mapLogo = (row: any): Logo => ({
  id: row.id,
  title: row.title,
  imageUrl: row.image_url,
  uploaderUid: row.uploader_uid,
  uploaderName: row.uploader_name,
  uploaderAvatar: row.uploader_avatar,
  uploaderEmail: row.uploader_email,
  votes: row.votes ?? [],
  createdAt: row.created_at,
})

  const sortedLogos = computed(() => {
    const list = [...logos.value]
    if (sortMode.value === 'votes') {
      return list.sort((a, b) => b.votes.length - a.votes.length)
    } else {
      return list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
    }
  })

  const subscribeLogos = () => {
    const channel = $supabase
      .channel('logos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logos',
        },
        (payload) => {
          console.log('Realtime payload:', payload)
          if (payload.eventType === 'INSERT') {
            logos.value = [mapLogo(payload.new), ...logos.value]
          } else if (payload.eventType === 'UPDATE') {
            const idx = logos.value.findIndex((l) => l.id === payload.new.id)
            if (idx !== -1) logos.value[idx] = mapLogo(payload.new)
          } else if (payload.eventType === 'DELETE') {
            logos.value = logos.value.filter((l) => l.id !== payload.old.id)
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    const fetchLogos = async () => {
      const { data, error } = await $supabase
        .from('logos')
        .select('*')
        .order('created_at', { ascending: false })
      console.log('Initial fetch:', { data, error })
      if (error) {
        console.error('Supabase error:', error)
      } else if (data) {
        logos.value = data.map(mapLogo)
      }
      logosLoading.value = false
    }
    fetchLogos()

    return () => {
      $supabase.removeChannel(channel)
    }
  }

  const uploadLogo = async (file: File, title: string): Promise<boolean> => {
    if (!user.value) return false
    if (!isVotingOpen()) {
      uploadError.value = 'Voting has closed. No more uploads allowed.'
      return false
    }
    uploadLoading.value = true
    uploadError.value = null

    try {
      const ext = file.name.split('.').pop()
      const path = `logos/${user.value.id}_${Date.now()}.${ext}`

      const { error: uploadError } = await $supabase.storage
        .from('logos')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = $supabase.storage.from('logos').getPublicUrl(path)
      const imageUrl = urlData.publicUrl

      const { error: dbError } = await $supabase.from('logos').insert({
        title: title.trim() || 'Untitled',
        image_url: imageUrl,
        uploader_uid: user.value.id,
        uploader_name: user.value.user_metadata?.full_name ?? user.value.user_metadata?.name ?? 'Anonymous',
        uploader_avatar: user.value.user_metadata?.avatar_url ?? user.value.user_metadata?.picture ?? '',
        uploader_email: user.value.email ?? '',
        votes: [],
      })

      if (dbError) throw dbError

      return true
    } catch (err: any) {
      uploadError.value = err.message ?? 'Upload failed. Please try again.'
      return false
    } finally {
      uploadLoading.value = false
    }
  }

  const toggleVote = async (logoId: string) => {
    if (!user.value || !isVotingOpen()) return
    const uid = user.value.id
    const logo = logos.value.find((l) => l.id === logoId)
    if (!logo) return

    const hasVoted = logo.votes.includes(uid)
    const newVotes = hasVoted
      ? logo.votes.filter((v) => v !== uid)
      : [...logo.votes, uid]

    const { error } = await $supabase
      .from('logos')
      .update({ votes: newVotes })
      .eq('id', logoId)

    if (error) console.error('Vote error:', error)
  }

  const updateLogo = async (logoId: string, title: string): Promise<boolean> => {
    if (!user.value) return false
    const logo = logos.value.find((l) => l.id === logoId)
    if (!logo || logo.uploaderUid !== user.value.id) return false

    const { error } = await $supabase
      .from('logos')
      .update({ title: title.trim() || 'Untitled' })
      .eq('id', logoId)

    if (error) {
      console.error('Update error:', error)
      return false
    }
    return true
  }

  const deleteLogo = async (logoId: string): Promise<boolean> => {
    if (!user.value) return false
    const logo = logos.value.find((l) => l.id === logoId)
    if (!logo || logo.uploaderUid !== user.value.id) return false

    // Delete from storage first
    const imagePath = logo.imageUrl.split('/logos/')[1]
    if (imagePath) {
      await $supabase.storage.from('logos').remove([imagePath])
    }

    // Delete from database
    const { error } = await $supabase
      .from('logos')
      .delete()
      .eq('id', logoId)

    if (error) {
      console.error('Delete error:', error)
      return false
    }
    return true
  }

  const hasVoted = (logo: Logo) => {
    return user.value ? logo.votes.includes(user.value.id) : false
  }

  return {
    logos: readonly(logos),
    sortedLogos,
    logosLoading: readonly(logosLoading),
    uploadLoading: readonly(uploadLoading),
    uploadError,
    sortMode,
    subscribeLogos,
    uploadLogo,
    toggleVote,
    updateLogo,
    deleteLogo,
    hasVoted,
  }
}