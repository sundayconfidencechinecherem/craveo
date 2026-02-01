export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-surface p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p className="text-xs text-gray-500">
          © {currentYear} Craveo - Food Social Media. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
