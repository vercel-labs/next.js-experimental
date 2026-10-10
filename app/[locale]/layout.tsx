export default async function LocaleLayout({children,params}:{children:React.ReactNode,params:Promise<{locale:string}>}) {
 const {locale}=await params
 return <main data-locale={locale}>{children}</main>
}
