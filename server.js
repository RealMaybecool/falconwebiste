const express = require("express");
const axios = require("axios");
const cors = require("cors");

const CLIENT_ID = "1378901870940258464";
const CLIENT_SECRET = "SubIMkYeG1z1jq6QMgaqHVTd1SD-J2Ze";
const REDIRECT_URI = "https://realmaybecool.github.io/falconwebiste/";
const GUILD_ID = "1378399333929713796";
const PREMIUM_ROLE_ID = "1378900467668488222";

const app = express();
app.use(cors());

app.get("/api/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const access_token = tokenRes.data.access_token;

    // Get user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userRes.data;

    // Get member info in your guild
    const memberRes = await axios.get(
      `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const member = memberRes.data;

    // Check for premium role
    const hasPremium = (member.roles || []).includes(PREMIUM_ROLE_ID);

    // Build avatar URL
    let avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    res.json({
      username: user.username,
      avatar,
      premium: hasPremium,
      id: user.id,
    });
  } catch (err) {
    res.status(500).json({ error: "OAuth2 or Discord API error", details: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on http://0.0.0.0:${PORT}`));
