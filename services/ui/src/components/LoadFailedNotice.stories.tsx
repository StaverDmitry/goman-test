import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadFailedNotice } from "./LoadFailedNotice";

const meta = {
  title: "Layout/LoadFailedNotice",
  id: "app-load-failed-notice",
  component: LoadFailedNotice,
  args: {
    title: "Couldn't load contacts.",
    body: "Reload to try again.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "What a page shows in place of its data when loading it failed: a title, a hint and a Reload button.",
      },
    },
  },
} satisfies Meta<typeof LoadFailedNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
