import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeader } from "./PageHeader";

const meta = {
  title: "Layout/PageHeader",
  id: "app-pageheader",
  component: PageHeader,
  args: {
    title: "Companies",
    lead: "The organisations you work with.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "The top of a screen: the page heading and a one-line lead under it.",
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dark: Story = { globals: { theme: "dark" } };
