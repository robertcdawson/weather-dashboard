export const buttonStyles = {
  base: "transition-all duration-200 ease-in-out active:scale-95",
  hover: "hover:brightness-110 hover:shadow-md",
  focus: "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
};

export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
}; 