import { useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { produce } from 'immer';
import { Dialog } from '@ark-ui/react/dialog';
import { updateSpace } from '@kineticdata/react';
import { Button, CloseButton } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { Panel } from '../../atoms/Panel.jsx';
import { Tooltip } from '../../atoms/Tooltip.jsx';
import { parseHexColor } from '../../helpers/theme.js';
import { themeActions } from '../../helpers/state.js';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import { callIfFn } from '../../helpers/index.js';

const SampleColorIndicator = ({ bg, className, error }) => (
  <div
    className={clsx('w-10 h-10 rounded-full border-2 border-black', className)}
    style={{ backgroundColor: bg }}
  >
    {error && (
      <Icon
        name="exclamation-circle"
        size={36}
        filled
        className="text-warning-400"
      />
    )}
  </div>
);

const ColorField = ({
  label,
  value,
  onChange,
  id,
  lightness,
  saturation,
  classes,
}) => {
  const color = parseHexColor(value);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        placeholder="Default Color"
      />
      <div className="mt-2 flex gap-2 items-center">
        {!value ? (
          classes.map(className => (
            <SampleColorIndicator key={className} className={className} />
          ))
        ) : !color ? (
          <>
            <SampleColorIndicator error />
            <div className="text-warning-500">Invalid hex color value</div>
          </>
        ) : (
          lightness.map((l, i) => {
            const variant = color.clone().toHSL();
            variant.lightness = l;
            if (saturation) {
              variant.saturation = Math.min(variant.saturation, saturation);
            }
            return (
              <SampleColorIndicator key={i} bg={variant.toString('hsl')} />
            );
          })
        )}
      </div>
    </div>
  );
};

export const ThemeEditor = () => {
  const mobile = useSelector(state => state.view.mobile);
  // Get redux theme state
  const theme = useSelector(state => state.theme);
  // State for updating the theme
  const [themeData, setThemeData] = useState(theme.parsed);
  // Store the initial theme for resetting the above themeData state
  const [initialThemeData, setInitialThemeData] = useState(theme.parsed);
  // Are there changes
  const dirty = isThemeDirty(themeData, initialThemeData);

  const handleColorChange = name => e =>
    setThemeData(t =>
      produce(t || {}, d => {
        if (!d.colors) d.colors = {};
        d.colors[name] = e.target.value;
      }),
    );
  const handleLogoChange = name => e =>
    setThemeData(t =>
      produce(t || {}, d => {
        if (!d.logo) d.logo = {};
        d.logo[name] = e.target.value;
      }),
    );

  const handlePreview = () =>
    themeActions.setTheme({
      data: { attributesMap: { Theme: [JSON.stringify(themeData)] } },
    });

  const handleReset = () => {
    themeActions.setTheme({
      data: { attributesMap: { Theme: [JSON.stringify(initialThemeData)] } },
    });
    setThemeData(initialThemeData);
  };

  const handleSave = () => {
    updateSpace({
      space: { attributesMap: { Theme: [JSON.stringify(themeData)] } },
    }).then(({ error }) => {
      if (error) {
        toastError({
          title: 'Failed to save theme changes',
          description: error.message,
        });
      } else {
        toastSuccess({ title: 'Successfully saved theme changes' });
        setInitialThemeData(themeData);
        themeActions.setTheme({
          data: { attributesMap: { Theme: [JSON.stringify(themeData)] } },
        });
        themeActions.disableEditor();
      }
    });
  };

  return (
    !mobile &&
    theme.editor && (
      <Panel>
        <Button
          slot="trigger"
          variant="custom"
          size="custom"
          className={clsx(
            'fixed right-0 top-24 h-28 w-10 rounded-l-2.5xl',
            'flex justify-center items-center border-primary-500 bg-gray-200',
            'hover:ring hover:ring-secondary-400 focus-visible:ring focus-visible:ring-secondary-400',
          )}
        >
          <Icon name="brush" />
        </Button>
        <div slot="content" className="flex flex-col gap-6">
          <div className="h3 flex justify-between items-center">
            Theme Editor
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
          </div>

          <p className="text-sm text-gray-900">
            You can enter hex color values for the primary, secondary, and gray
            colors, and the portal will use the hue and saturation of those
            colors to define several shades and tints of the colors to use
            (which will be shown below the fields).
          </p>

          <ColorField
            label="Primary Color"
            id="primary-color"
            value={themeData?.colors?.primary || ''}
            onChange={handleColorChange('primary')}
            lightness={[18, 74, 83, 87, 94, 96]}
            classes={[
              'bg-primary-900',
              'bg-primary-500',
              'bg-primary-400',
              'bg-primary-300',
              'bg-primary-200',
              'bg-primary-100',
            ]}
          />

          <ColorField
            label="Secondary Color"
            id="secondary-color"
            value={themeData?.colors?.secondary || ''}
            onChange={handleColorChange('secondary')}
            lightness={[32, 75, 91]}
            classes={[
              'bg-secondary-500',
              'bg-secondary-400',
              'bg-secondary-100',
            ]}
          />

          <ColorField
            label="Gray Color"
            id="gray-color"
            value={themeData?.colors?.gray || ''}
            onChange={handleColorChange('gray')}
            lightness={[42, 53, 91, 97.65]}
            saturation={12}
            classes={[
              'bg-gray-900',
              'bg-gray-500',
              'bg-gray-200',
              'bg-gray-100',
            ]}
          />

          <hr />

          <p className="text-sm text-gray-900">
            You can set URLs for the logo images to use in the portal. The Light
            Logo URL is for a logo image that will be displayed over a light
            background, and the Dark Logo URL is for a logo image that will be
            displayed over a dark background.
          </p>

          <div className="field">
            <label htmlFor="light-logo">Light Logo URL</label>
            <input
              type="text"
              id="light-logo"
              value={themeData?.logo?.standard || ''}
              onChange={handleLogoChange('standard')}
              placeholder="Default Logo"
            />
          </div>

          <div className="field">
            <label htmlFor="dark-logo">Dark Logo URL</label>
            <input
              type="text"
              id="dark-logo"
              value={themeData?.logo?.inverse || ''}
              onChange={handleLogoChange('inverse')}
              placeholder="Default Logo"
            />
          </div>

          <div className="mt-auto pt-6">
            <div className="flex gap-4">
              <Tooltip
                content="Preview will apply the changes to your session, but not save them to the space. You can close the panel and navigate around the portal."
                position="top"
                alignment="middle"
              >
                <Button
                  slot="trigger"
                  variant="secondary"
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              </Tooltip>
              <Tooltip
                content="Reset will revert the above fields to their original values, and will clear your previewed changes."
                position="top"
                alignment="middle"
              >
                <Button
                  slot="trigger"
                  variant="tertiary"
                  onClick={handleReset}
                  className="ml-auto"
                >
                  Reset
                </Button>
              </Tooltip>
              <Tooltip
                content="Save will store these values on the space so that they will apply to everyone."
                position="top"
                alignment="middle"
              >
                <Button slot="trigger" onClick={handleSave} disabled={!dirty}>
                  Save
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </Panel>
    )
  );
};

function isThemeDirty(theme, initialTheme) {
  return (
    (theme?.colors?.primary || '') !== (initialTheme?.colors?.primary || '') ||
    (theme?.colors?.secondary || '') !==
      (initialTheme?.colors?.secondary || '') ||
    (theme?.colors?.gray || '') !== (initialTheme?.colors?.gray || '') ||
    (theme?.logo?.standard || '') !== (initialTheme?.logo?.standard || '') ||
    (theme?.logo?.inverse || '') !== (initialTheme?.logo?.inverse || '')
  );
}
