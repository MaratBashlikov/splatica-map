import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { isAdmin } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  
  // Не проверяем авторизацию на странице логина (редирект)
  const isLoginPage = pathname === '/admin/login'
  
  if (!isLoginPage) {
    const admin = await isAdmin()

    if (!admin) {
      redirect('/login')
    }
  }

  return <>{children}</>
}

