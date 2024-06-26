'use client'
import { redirect } from 'next/navigation'
import { useContext } from 'react'
import { UserProfileContext } from '../context/UserProfileContext'
import ProfileContent from './ProfileContent'

export default function Profile() {
  const { user } = useContext(UserProfileContext)

  if (!user || !user.id) redirect('/login')
  return <ProfileContent />
}
