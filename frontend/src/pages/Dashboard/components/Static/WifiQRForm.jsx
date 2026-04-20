/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Wifi } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const WifiQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('WiFi QR');
  const { fgColor, bgColor, title, isLoading, error, setError, createQRCode } = useQRStore();
  const [networkName, setNetworkName] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [isHidden, setIsHidden] = useState(false);
  const { openSections, toggle } = useFormSections();

  // Construct the standard WIFI string format
  // No escaping — matches how Google/Apple generate WiFi QR codes
  const getWifiString = () => {
    if (!networkName) return '';
    const t = encryption === 'None' ? 'nopass' : encryption;
    const parts = [`WIFI:T:${t}`, `S:${networkName}`];
    if (encryption !== 'None' && password) parts.push(`P:${password}`);
    if (isHidden) parts.push('H:true');
    return parts.join(';') + ';;';
  };

  const wifiString = getWifiString();

  useEffect(() => {
    onLiveUpdate?.({ url: networkName ? wifiString : '', fgColor, bgColor, title });
  }, [wifiString, fgColor, bgColor, title, networkName]);

  const handleSubmit = async () => {
    setError(null);

    if (!networkName) {
      setError('Please enter a Network Name (SSID).');
      return;
    }

    if (encryption !== 'None' && !password) {
      setError('Password is required for WPA/WEP encrypted networks.');
      return;
    }

    const wifiValue = wifiString;

    const result = await createQRCode({
      title: title || `${networkName} Wi-Fi`,
      qrType: 'Wi-Fi',
      content: { networkName, password: encryption !== 'None' ? password : '', encryption, isHidden },
    });

    if (result.success) {
      setNetworkName('');
      setPassword('');
      setEncryption('WPA');
      setIsHidden(false);
      onGenerated(wifiValue);
    }
  };

  return (
    <FormShell icon={Wifi} iconColor="text-blue-500" label="Wi-Fi QR (Static)" accentColor="blue" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!networkName} error={error}>
      <Section icon={Wifi} title="Content" subtitle="Enter network details" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="blue">
        <Field label="Network Name (SSID)" required hint="The name of your Wi-Fi network as it appears on devices.">
          <input
            type="text"
            value={networkName}
            onChange={(e) => setNetworkName(e.target.value)}
            placeholder="e.g., Home_Network_5G"
            className={inputClass('blue')}
            required
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Encryption" hint='WPA is the most common. Choose "None" for open/guest networks.'>
            <select
              value={encryption}
              onChange={(e) => setEncryption(e.target.value)}
              className={`${inputClass('blue')} appearance-none`}
            >
              <option value="WPA">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP</option>
              <option value="None">None (Open Network)</option>
            </select>
          </Field>

          {encryption !== 'None' && (
            <Field label="Password" required hint="The password will be encoded in the QR code.">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Network password"
                className={inputClass('blue')}
              />
            </Field>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer mt-2">
          <input
            type="checkbox"
            checked={isHidden}
            onChange={(e) => setIsHidden(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            This is a hidden network
          </span>
        </label>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="blue" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="blue" />
    </FormShell>
  );
};

export default WifiQRForm;
