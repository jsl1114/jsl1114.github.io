import { FaLinkedinIn } from 'react-icons/fa6'
import { FiGithub } from 'react-icons/fi'
import { TbMail } from 'react-icons/tb'
import { FaRegFilePdf } from 'react-icons/fa'

import Logo from '../assets/logo.svg'
import CV from '../assets/cv_english.pdf'
import { SOCIALS } from '../constants/const'

const Navbar = () => {
  return (
    <nav className='py-4 w-full mb-10 flex items-center justify-between backdrop-blur-lg fixed z-10 -top-1 lg:top-0 lg:backdrop-blur-none lg:px-8'>
      <div className='flex flex-shrink-0 item-center'>
        <img
          className='mx-2 w-10'
          src={Logo}
          alt='Logo'
        />
      </div>
      <div className='m-8 flex items-center justify-center gap-4 text-2xl'>
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.name === 'CV' ? CV : s.link}
            target='_blank'
            rel='noopener noreferrer'
            className='transition duration-300 hover:text-violet-300'
          >
            {s.name === 'LinkedIn' && <FaLinkedinIn />}
            {s.name === 'GitHub' && <FiGithub />}
            {s.name === 'Email' && <TbMail />}
            {s.name === 'CV' && <FaRegFilePdf />}
          </a>
        ))}
      </div>
    </nav>
  )
}
export default Navbar
