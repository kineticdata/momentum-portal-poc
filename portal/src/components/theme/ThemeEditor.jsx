import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { produce } from 'immer';
import { Dialog } from '@ark-ui/react/dialog';
import { updateSpace, updateKapp } from '@kineticdata/react';
import { Button, CloseButton, TabButton } from '../../atoms/Button.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { Panel } from '../../atoms/Panel.jsx';
import { Tooltip } from '../../atoms/Tooltip.jsx';
import {
  createGrayVariants,
  createPrimaryVariants,
  createSecondaryVariants,
} from '../../helpers/theme.js';
import { themeActions } from '../../helpers/state.js';
import { toastError, toastSuccess } from '../../helpers/toasts.js';
import { ColorField } from '../../atoms/ColorField.jsx';

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

const ColorFieldGroup = ({
  label,
  value,
  onChange,
  variantFn,
  id,
  classes,
}) => {
  const [enabled, setEnabled] = useState(!!value);
  const variants = variantFn ? variantFn(value, null, true) : null;
  return (
    <div className="field">
      <label htmlFor={id} id={`${id}-name`}>
        {label}
      </label>
      <div className="mb-3 flex gap-2 items-center">
        {!value ? (
          classes.map(className => (
            <SampleColorIndicator key={className} className={className} />
          ))
        ) : !variants ? (
          <>
            <SampleColorIndicator error />
            <div className="text-warning-500">Invalid hex color value</div>
          </>
        ) : (
          variants.map(([, variant], i) => (
            <SampleColorIndicator key={i} bg={variant} />
          ))
        )}
        <label htmlFor={`${id}-customize`} className="ml-auto">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => {
              setEnabled(e.target.checked);
              if (!e.target.checked) {
                onChange('');
              }
            }}
            id={`${id}-customize`}
            aria-describedby={`${id}-name`}
          />
          Customize
        </label>
      </div>
      {enabled && (
        <ColorField
          id={id}
          value={value}
          onChange={onChange}
          alignment="start"
        ></ColorField>
      )}
    </div>
  );
};

export const ThemeEditor = () => {
  const mobile = useSelector(state => state.view.mobile);
  const [space, kapp] = useSelector(state => [state.app.space, state.app.kapp]);
  const spaceHasTheme = !!space?.attributesMap?.['Theme'];
  const kappHasTheme = !!kapp?.attributesMap?.['Theme'];
  // Theme name
  const [themeName, setThemeName] = useState(kappHasTheme ? 'Kapp' : 'Space');
  // Timestamp for when theme data was reloaded last
  const [timestamp, setTimestamp] = useState(new Date().getTime());
  // Get redux theme state
  const theme = useSelector(state => state.theme);
  // State for updating the theme
  const [themeData, setThemeData] = useState(theme.parsed[themeName]);
  // Store the initial theme for resetting the above themeData state
  const [initialThemeData, setInitialThemeData] = useState(theme.parsed);
  // Are there changes
  const dirty = isThemeDirty(themeData, initialThemeData[themeName]);

  // Update theme name when a kapp theme is loaded
  useEffect(
    () => {
      if (kappHasTheme) {
        setThemeName('Kapp');
        setInitialThemeData(theme.parsed);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kappHasTheme],
  );

  const handleThemeChange = newThemeName => {
    // Store any local changes so we don't lose them
    themeActions.setTheme({
      [themeName === 'Kapp' ? 'kapp' : 'space']: {
        attributesMap: { Theme: [JSON.stringify(themeData)] },
      },
      updateLive: false,
    });
    // Update the theme name state
    setThemeName(newThemeName);
  };

  // Update theme state when the themeName changes
  useEffect(
    () => {
      if (themeName) {
        setThemeData(theme.parsed[themeName]);
        setTimestamp(new Date().getTime());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [themeName],
  );

  const handleColorChange = useCallback(
    (name, color) =>
      setThemeData(t =>
        produce(t || {}, d => {
          if (!d.colors) d.colors = {};
          d.colors[name] = color;
        }),
      ),
    [],
  );
  const handlePrimaryColorChange = useCallback(
    color => handleColorChange('primary', color),
    [handleColorChange],
  );
  const handleSecondaryColorChange = useCallback(
    color => handleColorChange('secondary', color),
    [handleColorChange],
  );
  const handleGrayColorChange = useCallback(
    color => handleColorChange('gray', color),
    [handleColorChange],
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
      [themeName === 'Kapp' ? 'kapp' : 'space']: {
        attributesMap: { Theme: [JSON.stringify(themeData)] },
      },
    });

  const handleReset = () => {
    themeActions.setTheme({
      [themeName === 'Kapp' ? 'kapp' : 'space']: {
        attributesMap: { Theme: [JSON.stringify(initialThemeData[themeName])] },
      },
    });
    setThemeData(initialThemeData[themeName]);
    setTimestamp(new Date().getTime());
  };

  const handleSave = () => {
    (themeName === 'Kapp' ? updateKapp : updateSpace)({
      kappSlug: themeName === 'Kapp' ? kapp?.slug : undefined,
      [themeName === 'Kapp' ? 'kapp' : 'space']: {
        attributesMap: { Theme: [JSON.stringify(themeData)] },
      },
    }).then(({ error }) => {
      if (error) {
        toastError({
          title: 'Failed to save theme changes',
          description: error.message,
        });
      } else {
        toastSuccess({ title: 'Successfully saved theme changes' });
        setInitialThemeData(data => ({ ...data, [themeName]: themeData }));
        themeActions.setTheme({
          [themeName === 'Kapp' ? 'kapp' : 'space']: {
            attributesMap: { Theme: [JSON.stringify(themeData)] },
          },
        });
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

          <div className="flex flex-col items-center">
            <div
              className={clsx(
                // Mobile first styles
                'px-1 py-1 rounded-2xl flex gap-6 flex-none bg-primary-100 max-md:self-center mb-4',
                // Non mobile styles
                'md:px-6 md:py-3 md:rounded-full md:gap-8',
              )}
            >
              <TabButton
                active={themeName === 'Space'}
                onClick={() => handleThemeChange('Space')}
              >
                Space Theme
              </TabButton>
              <TabButton
                active={themeName === 'Kapp'}
                onClick={() => handleThemeChange('Kapp')}
              >
                Kapp Theme
              </TabButton>
            </div>

            <div className="w-full">
              {themeName === 'Space' ? (
                <p>
                  The space theme is stored in the &#34;Theme&#34;{' '}
                  <strong>space</strong> attribute. It is used on
                  unauthenticated pages, or on all pages when there is no
                  &#34;Theme&#34; kapp attribute definition defined.
                </p>
              ) : (
                <p>
                  The kapp theme is stored in the &#34;Theme&#34;{' '}
                  <strong>kapp</strong> attribute. It is used on all
                  authenticated pages.
                </p>
              )}
            </div>
          </div>

          <hr />

          {themeName === 'Space' && !spaceHasTheme ? (
            <div className="py-1.5 px-4 min-w-full text-warning-500">
              Create a &#34;Theme&#34; <strong>space</strong> attribute
              definition to be able to customize the space theme.
            </div>
          ) : themeName === 'Kapp' && !kappHasTheme ? (
            <div className="py-1.5 px-4 min-w-full text-warning-500">
              Create a &#34;Theme&#34; <strong>kapp</strong> attribute
              definition to be able to customize the kapp theme.
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-900">
                You can enter hex color values for the primary, secondary, and
                gray colors, and the portal will use the hue and saturation of
                those colors to define several shades and tints of the colors to
                use (which will be shown below the fields).
              </p>

              <ColorFieldGroup
                key={`${timestamp}-primary`}
                label="Primary Colors"
                id="primary-color"
                value={themeData?.colors?.primary || ''}
                onChange={handlePrimaryColorChange}
                variantFn={createPrimaryVariants}
                classes={[
                  'bg-[hsl(var(--def-primary-900))]',
                  'bg-[hsl(var(--def-primary-500))]',
                  'bg-[hsl(var(--def-primary-400))]',
                  'bg-[hsl(var(--def-primary-300))]',
                  'bg-[hsl(var(--def-primary-200))]',
                  'bg-[hsl(var(--def-primary-100))]',
                ]}
              />

              <ColorFieldGroup
                key={`${timestamp}-secondary`}
                label="Secondary Colors"
                id="secondary-color"
                value={themeData?.colors?.secondary || ''}
                onChange={handleSecondaryColorChange}
                variantFn={createSecondaryVariants}
                classes={[
                  'bg-[hsl(var(--def-secondary-500))]',
                  'bg-[hsl(var(--def-secondary-400))]',
                  'bg-[hsl(var(--def-secondary-100))]',
                ]}
              />

              <ColorFieldGroup
                key={`${timestamp}-gray`}
                label="Gray Colors"
                id="gray-color"
                value={themeData?.colors?.gray || ''}
                onChange={handleGrayColorChange}
                variantFn={createGrayVariants}
                classes={[
                  'bg-[hsl(var(--def-gray-950))]',
                  'bg-[hsl(var(--def-gray-900))]',
                  'bg-[hsl(var(--def-gray-500))]',
                  'bg-[hsl(var(--def-gray-200))]',
                  'bg-[hsl(var(--def-gray-100))]',
                ]}
              />

              <hr />

              <p className="text-sm text-gray-900">
                You can set a URL for the logo image to use in the portal.
              </p>

              <div className="field">
                <label htmlFor="light-logo">Logo URL</label>
                <input
                  key={`${timestamp}-logo`}
                  type="text"
                  id="light-logo"
                  value={themeData?.logo?.standard || ''}
                  onChange={handleLogoChange('standard')}
                  placeholder="Default Logo"
                />
              </div>

              <div className="mt-auto pt-6">
                <div className="flex gap-4 mt-4">
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
                    <Button
                      slot="trigger"
                      onClick={handleSave}
                      disabled={!dirty}
                    >
                      Save
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>
      </Panel>
    )
  );
};

function isThemeDirty(theme, initialTheme) {
  return (
    (theme?.colors?.primary || '').toUpperCase() !==
      (initialTheme?.colors?.primary || '').toUpperCase() ||
    (theme?.colors?.secondary || '').toUpperCase() !==
      (initialTheme?.colors?.secondary || '').toUpperCase() ||
    (theme?.colors?.gray || '').toUpperCase() !==
      (initialTheme?.colors?.gray || '').toUpperCase() ||
    (theme?.logo?.standard || '') !== (initialTheme?.logo?.standard || '')
  );
}
