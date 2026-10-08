'use client'
import dynamic from 'next/dynamic'
const MdView = dynamic(() => import('./MdView.jsx'))
export default function Parent1(){ return <div>p1<MdView id={1} /></div> }
