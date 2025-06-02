import axios from "axios";

const CLIENT_ID = "1378901870940258464";
const CLIENT_SECRET = "SubIMkYeG1z1jq6QMgaqHVTd1SD-J2Ze";
const REDIRECT_URI = "https://realmaybecool.github.io/falconwebiste/";
const GUILD_ID = "1378399333929713796";
const PREMIUM_ROLE_ID = "1378900467668488222";

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: "identify guilds",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const access_token = tokenRes.data.access_token;

    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userRes.data;

    let premium = false;
    let avatarUrl = `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
    try {
      const memberRes = await axios.get(
        `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const member = memberRes.data;
      premium = member.roles && member.roles.includes(PREMIUM_ROLE_ID);
    } catch (e) {
      premium = false;
    }

    if (user.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }

    res.json({
      id: user.id,
      username: `${user.username}#${user.discriminator}`,
      avatar: avatarUrl,
      premium,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
