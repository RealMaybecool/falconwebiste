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

app.get("/", (req, res) => {
  res.send("Falcon Website Backend is running!");
});

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
        scope: "identify guilds",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const access_token = tokenRes.data.access_token;

    // Get user info
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = userRes.data;

    // Get guild member info to check premium role
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
      // Not a member or can't fetch roles
      premium = false;
    }

    // Custom avatar if set
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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Backend running on http://0.0.0.0:${PORT}`)
);
