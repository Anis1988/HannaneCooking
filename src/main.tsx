import { lazy, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Home from './pages/Home'

// Pages secondaires chargées à la demande : premier affichage plus rapide sur mobile.
const Tarifs = lazy(() => import('./pages/Tarifs'))
const Menus = lazy(() => import('./pages/Menus'))
const Faq = lazy(() => import('./pages/Faq'))
const GiftCards = lazy(() => import('./pages/GiftCards'))
const PostPartum = lazy(() => import('./pages/PostPartum'))
const BecomeChef = lazy(() => import('./pages/Forms').then((m) => ({ default: m.BecomeChef })))
const Contact = lazy(() => import('./pages/Forms').then((m) => ({ default: m.Contact })))
const Cgv = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Cgv })))
const Privacy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })))
const NotFound = lazy(() => import('./pages/Legal').then((m) => ({ default: m.NotFound })))
const Booking = lazy(() => import('./pages/booking/Booking'))

// Préchargement discret après l'affichage : la navigation reste instantanée.
const preload = () => {
  for (const load of [() => import('./pages/booking/Booking'), () => import('./pages/Tarifs'), () => import('./pages/Menus'), () => import('./pages/GiftCards'), () => import('./pages/PostPartum'), () => import('./pages/Faq'), () => import('./pages/Forms'), () => import('./pages/Legal')]) load()
}
window.addEventListener('load', () => setTimeout(preload, 1200), { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tarifs" element={<Tarifs />} />
          <Route path="menus" element={<Menus />} />
          <Route path="faq" element={<Faq />} />
          <Route path="cartes-cadeaux" element={<GiftCards />} />
          <Route path="post-partum" element={<PostPartum />} />
          <Route path="devenir-cheffe" element={<BecomeChef />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cgv" element={<Cgv />} />
          <Route path="confidentialite" element={<Privacy />} />
          <Route path="reservation/*" element={<Booking />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
