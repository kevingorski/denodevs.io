const getProfileUrl = new URL("https://people.googleapis.com/v1/people/me");
const validatePersonUrl = new URL(getProfileUrl);
validatePersonUrl.searchParams.append(
  "personFields",
  // This doesn't appear to add anything to the results, but the "resourceName": "people/ID" is still returned
  "clientData",
);

// Possible future implementation
// const createPersonFields = [
//   "emailAddresses",
//   "locations",
//   "names",
//   "photos",
// ];
// const createPersonUrl = new URL(getProfileUrl);
// createPersonUrl.searchParams.append(
//   "personFields",
//   createPersonFields.join(","),
// );

interface GoogleProfile {
  etag: string;
  resourceName: string;
}

async function getGoogleProfile(url: URL, accessToken: string) {
  const apiResponse = await fetch(
    url,
    {
      headers: { authorization: `Bearer ${accessToken}` },
    },
  );
  if (!apiResponse.ok) {
    await apiResponse.body?.cancel();
    console.error("Failed fetching Google profile", apiResponse);
    throw new Error();
  }
  return await apiResponse.json() as GoogleProfile;
}

export async function getGoogleUser(accessToken: string) {
  const response = await getGoogleProfile(validatePersonUrl, accessToken);
  const googleId = response.resourceName.split("/").pop();
  if (!googleId) {
    throw new Error();
  }
  return { googleId };
}
