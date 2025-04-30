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

export const Badges = () => {
  const [variantInfo, setVariantInfo] = useState('');

  const Variant = useMemo(
    () =>
      ({ className, children, disabled }) => (
        <span
          className={className}
          onClick={() => {
            setVariantInfo(className);
            setTimeout(() => {
              setVariantInfo(vi => (vi === className ? '' : vi));
            }, 5000);
          }}
        >
          {children}
        </span>
      ),
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <h2>Badges</h2>
      <div className="flex flex-wrap gap-1">
        <Variant className="kbadge">Default</Variant>
        <Variant className="kbadge kbadge-primary">Primary</Variant>
        <Variant className="kbadge kbadge-secondary">Secondary</Variant>
        <Variant className="kbadge kbadge-accent">Accent</Variant>
        <Variant className="kbadge kbadge-neutral">Neutral</Variant>
        <Variant className="kbadge kbadge-info">Info</Variant>
        <Variant className="kbadge kbadge-success">Success</Variant>
        <Variant className="kbadge kbadge-warning">Warning</Variant>
        <Variant className="kbadge kbadge-error">Error</Variant>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Variant className="kbadge kbadge-primary kbadge-xs">XSmall</Variant>
        <Variant className="kbadge kbadge-primary kbadge-sm">Small</Variant>
        <Variant className="kbadge kbadge-primary">Medium</Variant>
        <Variant className="kbadge kbadge-primary kbadge-lg">Large</Variant>
        <Variant className="kbadge kbadge-primary kbadge-xl">XLarge</Variant>
        <Variant className="kbadge kbadge-primary">
          <Icon name="check" size={16} />
          With Icon
        </Variant>
      </div>
      <div className="block">
        {variantInfo ? (
          <div className="mockup-code">
            <pre>{variantInfo}</pre>
          </div>
        ) : (
          'Click a badge to see what classes it uses.'
        )}
      </div>
    </div>
  );
};
