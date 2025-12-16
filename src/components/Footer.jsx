const Footer = () => {
  return (
      <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 flex justify-center p-8">
        <p>&copy;</p>
        <p className="mr-1 italic">Jason Liu {new Date().getFullYear()}</p>
      </div>
  );
};
export default Footer;
