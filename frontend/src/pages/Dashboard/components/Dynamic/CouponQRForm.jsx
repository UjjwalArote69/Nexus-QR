/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import useQRStore from '../../../../store/qrStore';
import { Ticket, Building2, Tag, Calendar, Link as LinkIcon, AlignLeft } from 'lucide-react';
import { FormShell, Section, DesignSection, SettingsSection, Field, inputClass, inputWithIconClass, useFormSections } from '../FormKit';
import usePageTitle from '../../../../hooks/usePageTitle';

const CouponQRForm = ({ onBack, onGenerated, onLiveUpdate }) => {
  usePageTitle('Coupon QR');
  const { fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl, isLoading, error, setError, createQRCode } = useQRStore();

  const [coupon, setCoupon] = useState({
    companyName: '', offerTitle: '', description: '', couponCode: '', validUntil: '', buttonUrl: '', buttonText: 'Redeem Now'
  });
  const { openSections, toggle } = useFormSections();

  useEffect(() => {
    onLiveUpdate?.({ url: 'https://klink.com/preview-coupon', fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl });
  }, [coupon, fgColor, bgColor, title, dotStyle, cornerSquareStyle, logoDataUrl]);

  const handleChange = (e) => {
    setCoupon({ ...coupon, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);

    if (!coupon.companyName || !coupon.offerTitle || !coupon.couponCode) {
      setError('Company Name, Offer Title, and Coupon Code are required.');
      return;
    }

    const submitData = { ...coupon };
    if (submitData.buttonUrl && !/^https?:\/\//i.test(submitData.buttonUrl.trim())) {
      submitData.buttonUrl = `https://${submitData.buttonUrl.trim()}`;
    }

    const result = await createQRCode({
      title: title || `${coupon.companyName} Coupon`,
      qrType: 'Coupon',
      content: submitData,
    });

    if (result.success) {
      setCoupon({ companyName: '', offerTitle: '', description: '', couponCode: '', validUntil: '', buttonUrl: '', buttonText: 'Redeem Now' });
      onGenerated(result.qrLink);
    }
  };

  return (
    <FormShell icon={Ticket} iconColor="text-orange-500" label="Coupon QR" accentColor="orange" onBack={onBack} onSubmit={handleSubmit} isLoading={isLoading} disabled={!coupon.companyName || !coupon.couponCode} error={error}>
      <Section icon={Ticket} title="Coupon Details" subtitle="Setup your discount offer" isOpen={openSections.content} onToggle={() => toggle('content')} accentColor="orange">
        <div className="space-y-4">
          <Field label="Company / Brand Name" required icon={Building2}>
            <input type="text" name="companyName" value={coupon.companyName} onChange={handleChange} placeholder="e.g., Nexus Shop" className={inputWithIconClass('orange')} required />
          </Field>
          <Field label="Offer Title" required>
            <input type="text" name="offerTitle" value={coupon.offerTitle} onChange={handleChange} placeholder="e.g., 20% OFF Entire Order" className={inputClass('orange')} required />
          </Field>
          <Field label="Description / Terms" icon={AlignLeft}>
            <textarea name="description" value={coupon.description} onChange={handleChange} rows="2" placeholder="Valid on all items. Cannot be combined with other offers." className={`${inputWithIconClass('orange')} resize-none`}></textarea>
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Coupon Code" required icon={Tag}>
            <input type="text" name="couponCode" value={coupon.couponCode} onChange={handleChange} placeholder="e.g., SAVE20" className={`${inputWithIconClass('orange')} uppercase font-bold tracking-wider`} required />
          </Field>
          <Field label="Valid Until (Optional)" icon={Calendar}>
            <input type="date" name="validUntil" value={coupon.validUntil} onChange={handleChange} className={inputWithIconClass('orange')} />
          </Field>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Button Link URL" icon={LinkIcon} className="col-span-2 sm:col-span-1">
            <input type="url" name="buttonUrl" value={coupon.buttonUrl} onChange={handleChange} placeholder="https://yourstore.com" className={inputWithIconClass('orange')} />
          </Field>
          <Field label="Button Text" className="col-span-2 sm:col-span-1">
            <input type="text" name="buttonText" value={coupon.buttonText} onChange={handleChange} placeholder="Redeem Now" className={inputClass('orange')} />
          </Field>
        </div>
      </Section>
      <DesignSection isOpen={openSections.design} onToggle={() => toggle('design')} accentColor="orange" />
      <SettingsSection isOpen={openSections.settings} onToggle={() => toggle('settings')} accentColor="orange" />
    </FormShell>
  );
};

export default CouponQRForm;
