import React from "react";

import { Dock, DockIcon } from "@/components/magicui/dock";
import { FaLinkedinIn, FaRegFilePdf } from 'react-icons/fa6'
import { FiGithub } from 'react-icons/fi'
import { TbMail } from 'react-icons/tb'
import CV from '../assets/jason_liu_cv.pdf'

export default function BottomNav() {
  return (
    <div className="relative">
      <Dock direction="bottom" iconSize={40} iconMagnification={60} className="border border-[#7C7A7B] gap-4">
        <DockIcon className='bg-white/10 text-[#D4D4D4]'>
            <a href="https://github.com/jsl1114" target="_blank" rel="noopener noreferrer">
              <Icons.gitHub className="size-6" />
            </a>
        </DockIcon>
        <DockIcon className='bg-white/10'>
          <a href="https://www.linkedin.com/in/jinsen-liu/" target="_blank" rel="noopener noreferrer">
            <Icons.linkedin className="size-6" />
          </a>
        </DockIcon>
        <DockIcon className='bg-white/10'>
          <a href="mailto:jl13869@nyu.edu" target="_blank" rel="noopener noreferrer">
            <Icons.email className="size-6" />
          </a>
        </DockIcon>
        <DockIcon className='bg-white/10'>
          <a href={CV} target="_blank" rel="noopener noreferrer">
            <Icons.cv className="size-6" />
          </a>
        </DockIcon>
      </Dock>
    </div>
  );
}

const Icons = {
  linkedin: (props) => (
    <FaLinkedinIn {...props} />
  ),
  gitHub: (props) => (
    <FiGithub {...props} />
  ),
  email: (props) => (
    <TbMail {...props} />
  ),
  cv: (props) => (
    <FaRegFilePdf {...props} />
  ),
};
