import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'danger';
};
export default function Button({ variant = 'default', ...props }: Props) {
  const cls = ['btn'];
  if (variant === 'primary') cls.push('primary');
  if (variant === 'danger') cls.push('danger');
  return <button {...props} className={cls.join(' ')} />;
}
