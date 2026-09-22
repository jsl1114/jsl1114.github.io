const Footer = () => {
  return (
      <div className="text-sm font-normal text-[var(--color-muted)] dark:text-[var(--color-muted-dark)] flex justify-center p-8">
        <p>&copy;</p>
        <p className="mr-1 italic">Jason Liu {new Date().getFullYear()}</p>
      </div>
  );
};
export default Footer;
