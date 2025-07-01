'use client'
import { useEffect } from 'react'
import LogRocket from 'logrocket'

export default function LogRocketInit() {
  useEffect(() => {
    LogRocket.init('4pjmeb/m24')
  }, [])
  return null
}
