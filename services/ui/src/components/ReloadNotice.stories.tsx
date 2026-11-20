import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReloadNotice } from "./ReloadNotice";

const meta = {
  title: "Layout/ReloadNotice",
  id: "app-reloadnotice",
  component: ReloadNotice,
  args: {
    title: "Couldn't load the companies.",
    body: "Reload to try again.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "A full-page notice for a screen whose data failed to load: the title is the page heading, with a Reload button.",
      },
    },
  },
} satisfies Meta<typeof ReloadNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
