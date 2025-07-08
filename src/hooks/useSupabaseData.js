import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSalas() {
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalas()
  }, [])

  const fetchSalas = async () => {
    try {
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      setSalas(data || [])
    } catch (error) {
      console.error('Error fetching salas:', error)
      setSalas([]) // Set empty array on error to prevent crashes
    } finally {
      setLoading(false)
    }
  }

  return { salas, loading, refetch: fetchSalas }
}

export function useReservas(userId) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchReservas()
    }
  }, [userId])

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          salas (nome, ubicacion)
        `)
        .eq('user_id', userId)
        .order('fecha', { ascending: false })

      if (error) throw error
      setReservas(data || [])
    } catch (error) {
      console.error('Error fetching reservas:', error)
      setReservas([]) // Set empty array on error to prevent crashes
    } finally {
      setLoading(false)
    }
  }

  const createReserva = async (reservaData) => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .insert([{
          ...reservaData,
          user_id: userId,
        }])
        .select()

      if (error) throw error
      await fetchReservas()
      return { data, error: null }
    } catch (error) {
      console.error('Error creating reserva:', error)
      return { data: null, error }
    }
  }

  const cancelReserva = async (reservaId) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', reservaId)
        .eq('user_id', userId)

      if (error) throw error
      await fetchReservas()
      return { error: null }
    } catch (error) {
      console.error('Error canceling reserva:', error)
      return { error }
    }
  }

  return { 
    reservas, 
    loading, 
    createReserva, 
    cancelReserva, 
    refetch: fetchReservas 
  }
}

export function useReservasBySalaAndDate(salaId, fecha) {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (salaId && fecha) {
      fetchReservas()
    }
  }, [salaId, fecha])

  const fetchReservas = async () => {
    try {
      const { data, error } = await supabase
        .from('reservas')
        .select('*')
        .eq('sala_id', salaId)
        .gte('fecha', `${fecha}T00:00:00`)
        .lt('fecha', `${fecha}T23:59:59`)
        .neq('estado', 'cancelada')

      if (error) throw error
      setReservas(data || [])
    } catch (error) {
      console.error('Error fetching reservas:', error)
      setReservas([]) // Set empty array on error to prevent crashes
    } finally {
      setLoading(false)
    }
  }

  return { reservas, loading, refetch: fetchReservas }
}