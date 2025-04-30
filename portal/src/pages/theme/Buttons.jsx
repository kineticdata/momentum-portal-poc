import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Icon } from '../../atoms/Icon.jsx';

const colorVariants = {
  '': 'Default',
  'kbtn-primary': 'Primary',
  'kbtn-secondary': 'Secondary',
  'kbtn-accent': 'Accent',
  'kbtn-neutral': 'Neutral',
  'kbtn-info': 'Info',
  'kbtn-success': 'Success',
  'kbtn-warning': 'Warning',
  'kbtn-danger': 'Danger',
};

export const Buttons = () => {
  const [variant, setVariant] = useState('');
  const [variantInfo, setVariantInfo] = useState('');

  const Variant = useMemo(
    () =>
      ({ className, children, disabled }) => (
        <button
          className={className}
          disabled={disabled}
          onClick={() => {
            setVariantInfo(className);
            setTimeout(() => {
              setVariantInfo(vi => (vi === className ? '' : vi));
            }, 5000);
          }}
        >
          {children}
        </button>
      ),
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <h2>Buttons</h2>
      <div className="flex flex-wrap gap-1">
        <button className="kbtn" onClick={() => setVariant('')}>
          Default
        </button>
        <button
          className="kbtn kbtn-primary"
          onClick={() => setVariant('kbtn-primary')}
        >
          Primary
        </button>
        <button
          className="kbtn kbtn-secondary"
          onClick={() => setVariant('kbtn-secondary')}
        >
          Secondary
        </button>
        <button
          className="kbtn kbtn-accent"
          onClick={() => setVariant('kbtn-accent')}
        >
          Accent
        </button>
        <button
          className="kbtn kbtn-neutral"
          onClick={() => setVariant('kbtn-neutral')}
        >
          Neutral
        </button>
        <button
          className="kbtn kbtn-info"
          onClick={() => setVariant('kbtn-info')}
        >
          Info
        </button>
        <button
          className="kbtn kbtn-success"
          onClick={() => setVariant('kbtn-success')}
        >
          Success
        </button>
        <button
          className="kbtn kbtn-warning"
          onClick={() => setVariant('kbtn-warning')}
        >
          Warning
        </button>
        <button
          className="kbtn kbtn-error"
          onClick={() => setVariant('kbtn-error')}
        >
          Error
        </button>
      </div>
      <div className="block">
        Click one of the above buttons to see its available variants below.
      </div>

      <h3>
        Variants <small>[ {colorVariants[variant]} ]</small>
      </h3>
      <div className="flex flex-wrap gap-1 items-center">
        <Variant className={clsx('kbtn', variant)}>Default</Variant>
        <Variant className={clsx('kbtn kbtn-outline', variant)}>
          Outline
        </Variant>
        <Variant className={clsx('kbtn kbtn-ghost', variant)}>Ghost</Variant>
        <Variant className={clsx('kbtn', variant)}>
          With Icon
          <Icon name="cat" />
        </Variant>
        <Variant className={clsx('kbtn kbtn-circle', variant)} title="Circle">
          <Icon name="cat" />
        </Variant>
        <Variant className={clsx('kbtn kbtn-xs', variant)}>XSmall</Variant>
        <Variant className={clsx('kbtn kbtn-sm', variant)}>XSmall</Variant>
        <Variant className={clsx('kbtn kbtn-md', variant)}>Medium</Variant>
        <Variant className={clsx('kbtn kbtn-lg', variant)}>Large</Variant>
        <Variant className={clsx('kbtn', variant)} disabled>
          Disabled
        </Variant>
      </div>
      <div className="block">
        {variantInfo ? (
          <div className="mockup-code">
            <pre>{variantInfo}</pre>
          </div>
        ) : (
          'Click a variant button to see what classes it uses.'
        )}
      </div>
    </div>
  );
};
