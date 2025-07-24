'use client'
import dynamic from 'next/dynamic'

const InscricaoForm = dynamic(() => import('./InscricaoForm'), { ssr: false })

export default InscricaoForm
