export const metadata = {
  title: "Privacy Policy — AI Sales Executive",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-ink">
      <h1 className="font-display text-2xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

      <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink/90">
        <p>
          AI Sales Executive (&quot;the app&quot;) is a tool that connects a business&apos;s Instagram
          professional account to a unified inbox, so incoming direct messages can be viewed and
          managed in one place. This policy explains what data the app accesses, how it&apos;s used,
          and how you can remove it.
        </p>

        <section>
          <h2 className="font-display text-lg font-semibold">What we access</h2>
          <p className="mt-2">When you connect your Instagram account, the app requests:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your Instagram professional account&apos;s username and account ID</li>
            <li>An access token used to read direct messages sent to that account</li>
            <li>The content of direct messages sent to your account by your customers</li>
          </ul>
          <p className="mt-2">
            We do not access your personal Instagram account, your followers list, your posts, or
            any data unrelated to direct messages sent to the connected professional account.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">How we use it</h2>
          <p className="mt-2">
            Message content and sender information are stored so they can be displayed in your
            app Inbox. The access token is stored so the app can continue receiving new messages
            without asking you to reconnect. We do not sell this data, use it for advertising, or
            share it with any third party other than Meta&apos;s own APIs (which are required to
            deliver the messages to us in the first place).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Storage and security</h2>
          <p className="mt-2">
            Data is stored in a private PostgreSQL database accessible only to the app&apos;s
            backend. Access tokens are never exposed to the browser or displayed in the interface
            in plain text.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Retention and deletion</h2>
          <p className="mt-2">
            You can disconnect your Instagram account at any time from the app&apos;s Settings
            page, which immediately deletes the stored access token and connection details from
            our database. To request deletion of stored message/conversation history as well,
            email us at the address below and we will remove it within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold">Contact</h2>
          <p className="mt-2">
            Questions about this policy or a data deletion request can be sent to{" "}
            <a href="mailto:uiuxbeez@gmail.com" className="underline">
              uiuxbeez@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
