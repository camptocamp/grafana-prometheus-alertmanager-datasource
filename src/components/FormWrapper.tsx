// @ts-nocheck
import React from 'react';

interface WrapperProps {
  disabled?: boolean;
  stretch?: boolean;
  children: any;
  error?: boolean;
}

export default function FormWrapper(props: WrapperProps) {
  const style: any = { display: 'flex' };

  if (props.disabled) {
    style.opacity = '0.4';
    style.pointerEvents = 'none';
  }
  if (props.error) {
    style['box-shadow'] = '0px 0px 5px red';
  }

  if (props.stretch) {
    style.width = '100%';
  }

  return <div style={style}>{props.children}</div>;
}
