import TechSlider from '../components/TechSlider'

const Technologies = () => {
  return (
    <div className='flex flex-wrap flex-col px-2 text-center border-b border-neutral-800 pb-20'>
      {/* <h1 className='text-4xl text-center my-20'>Technologies</h1> */}
      <div className='flex flex-wrap justify-center items-center size-full'>
        <TechSlider />
      </div>
    </div>
  )
}
export default Technologies
