import { redirect } from 'next/navigation';

export default function DeprecatedAIAssistant() {
  // Redirect to the new shortcut wizard
  redirect('/user-dashboard/campaigns/new');
}
