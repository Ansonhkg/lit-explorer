import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const WelcomeAlert = () => {
  return (
    <Alert className="border-l-4 border-green-500 bg-green-50 p-4 rounded-md shadow-md">
      <AlertTitle className="text-xl font-semibold text-green-700">
        Welcome to Lit Explorer! 👋🏻
      </AlertTitle>
      <AlertDescription className="text-green-600">
        <p>Please sign in to your web3 account to access full features.</p>
        <p className="mt-2">
          To learn more about Programmable Key Pairs (PKPs) and Lit Actions,
          read our{" "}
          <a
            target="_blank"
            href="https://developer.litprotocol.com/"
            className="text-blue-500 hover:underline"
          >
            documentation
          </a>
          .
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default WelcomeAlert;
