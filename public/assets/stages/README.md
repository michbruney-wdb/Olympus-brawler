# Production Stage Exports

Production stage layers should use this structure:

```text
public/assets/stages/{stage}/background.png
public/assets/stages/{stage}/midground.png
public/assets/stages/{stage}/foreground.png
public/assets/stages/{stage}/platforms.png
public/assets/stages/{stage}/lighting.png
public/assets/stages/{stage}/thumbnail.png
```

The prototype still loads `public/assets/backgrounds/{stage}.png`. Move each arena to layered stage assets when its production art pass begins.
