import { PageHeader } from "@/components/shared/states";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  const { mapEmbed: _unused, ...values } = s;
  void _unused;
  return (
    <>
      <PageHeader crumb="System / Site settings" title="Site settings" />
      <SettingsForm values={values} />
    </>
  );
}
