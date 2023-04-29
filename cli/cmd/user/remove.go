package user

import (
	"fmt"

	"github.com/rilldata/rill/cli/cmd/cmdutil"
	"github.com/rilldata/rill/cli/pkg/config"
	adminv1 "github.com/rilldata/rill/proto/gen/rill/admin/v1"
	"github.com/spf13/cobra"
)

func RemoveCmd(cfg *config.Config) *cobra.Command {
	var projectName string
	var email string

	removeCmd := &cobra.Command{
		Use:   "remove",
		Short: "Remove",
		RunE: func(cmd *cobra.Command, args []string) error {
			cmdutil.StringPromptIfEmpty(&email, "Enter email")

			client, err := cmdutil.Client(cfg)
			if err != nil {
				return err
			}
			defer client.Close()

			if projectName != "" {
				_, err = client.RemoveProjectMember(cmd.Context(), &adminv1.RemoveProjectMemberRequest{
					Organization: cfg.Org,
					Project:      projectName,
					Email:        email,
				})
				if err != nil {
					return err
				}

				cmdutil.SuccessPrinter(fmt.Sprintf("Removed user %q from project \"%s/%s\"", email, cfg.Org, projectName))
			} else {
				_, err = client.RemoveOrganizationMember(cmd.Context(), &adminv1.RemoveOrganizationMemberRequest{
					Organization: cfg.Org,
					Email:        email,
				})
				if err != nil {
					return err
				}
				cmdutil.SuccessPrinter(fmt.Sprintf("Removed user %q from organization %q", email, cfg.Org))
			}

			return nil
		},
	}

	removeCmd.Flags().StringVar(&cfg.Org, "org", cfg.Org, "Organization")
	removeCmd.Flags().StringVar(&projectName, "project", "", "Project")
	removeCmd.Flags().StringVar(&email, "email", "", "Email of the user")

	return removeCmd
}