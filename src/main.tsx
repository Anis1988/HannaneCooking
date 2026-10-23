import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Tarifs from './pages/Tarifs'
import Menus from './pages/Menus'
import Faq from './pages/Faq'
import GiftCards from './pages/GiftCards'
import PostPartum from './pages/PostPartum'
import { BecomeChef, Contact } from './pages/Forms'
import { Cgv, Privacy, NotFound } from './pages/Legal'
import Booking from './pages/booking/Booking'

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
