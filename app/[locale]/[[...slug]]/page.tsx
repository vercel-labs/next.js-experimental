export const ensureStatic = 'navigation'
import Link from 'next/link'
const pages=[undefined,['listing'],...Array.from({length:15},(_,i)=>[`item-${i+1}`])]
export function generateStaticParams(){return pages.map(slug=>({locale:'en',slug:slug||[]}))}
export default async function Page({params}:{params:Promise<{locale:string,slug?:string[]}>}){
 const {locale,slug=[]}=await params
 return <><h1>{slug.join('/')||'home'}</h1><Link href={`/${locale}`}>home</Link>{pages.slice(2).map(x=><Link key={x![0]} href={`/${locale}/${x![0]}`} style={{display:'block'}}>{x![0]}</Link>)}</>
}
