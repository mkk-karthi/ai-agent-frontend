import MetaHead from "../../components/common/MetaHead";

export default function Privacy() {
  return (
    <>
      <MetaHead
        title="Privacy Policy"
        description="Privacy policy and data handling practices for MKK Agent users."
      />
      <div className="max-w-4xl mx-auto p-6 md:p-12 text-gray-800 dark:text-gray-200">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Last updated: October 2026
        </p>
        <section className="space-y-4 text-base leading-relaxed">
          <p>
            At MKK Agent, we respect your privacy and are committed to protecting the personal data
            you share with us. This policy describes how we collect, store, and process your
            information.
          </p>
          <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
          <p>
            We collect account information (such as your name, email, and authentication details)
            and conversational prompts processed by the AI models you choose to interact with.
          </p>
          <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Information</h2>
          <p>
            Your information is used solely to provide, operate, and maintain the chat service,
            personalize your agent interactions, and secure your account.
          </p>
        </section>
      </div>
    </>
  );
}